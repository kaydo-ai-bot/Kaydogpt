import { AppBuilderProject, ProjectFile, ProjectVersion, ProjectDeployment, SubscriptionStatus } from '../types';
import { db, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc } from '../lib/firebase';
import JSZip from 'jszip';

const LOCAL_STORAGE_KEY_PREFIX = 'berry_app_projects_';

export class AppBuilderService {
  // Check if current user has valid PRO access (All features 100% Free & Unlimited for all users)
  static async verifyProAccess(userId: string, userEmail?: string, userRole?: string): Promise<{ isPro: boolean; status: SubscriptionStatus }> {
    return { isPro: true, status: 'PRO_ACTIVE' };
  }

  // Get all projects for current user
  static async getUserProjects(userId: string): Promise<AppBuilderProject[]> {
    if (!userId) return [];

    try {
      // 1. Try Firestore
      const projRef = collection(db, 'app_projects');
      const q = query(projRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const list: AppBuilderProject[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as AppBuilderProject);
        });
        return list;
      }
    } catch (err) {
      console.warn('Firestore load projects failed, checking local cache:', err);
    }

    // Local storage fallback for offline / immediate responsiveness
    const local = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [];
      }
    }

    return [];
  }

  // Save or update a project
  static async saveProject(project: AppBuilderProject): Promise<void> {
    const updated = {
      ...project,
      updatedAt: Date.now(),
    };

    // Save locally
    const userId = project.userId;
    try {
      const existing = await this.getUserProjects(userId);
      const index = existing.findIndex(p => p.id === project.id);
      let nextList = [...existing];
      if (index >= 0) {
        nextList[index] = updated;
      } else {
        nextList.unshift(updated);
      }
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(nextList));
    } catch (e) {
      console.warn('Local storage save error:', e);
    }

    // Save in Firestore
    try {
      await setDoc(doc(db, 'app_projects', project.id), updated);
    } catch (err) {
      console.warn('Firestore project save warning:', err);
    }
  }

  // Delete a project
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      const existing = await this.getUserProjects(userId);
      const filtered = existing.filter(p => p.id !== projectId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Local storage delete error:', e);
    }

    try {
      await deleteDoc(doc(db, 'app_projects', projectId));
    } catch (err) {
      console.warn('Firestore project delete warning:', err);
    }
  }

  // Call Server-Side AI Project Generation / Editing Agent
  static async generateOrModifyProject(params: {
    userId: string;
    userEmail?: string;
    prompt: string;
    command?: string; // '/create', '/edit', '/fix', etc.
    existingProject?: AppBuilderProject;
    targetFilePath?: string;
  }): Promise<{
    success: boolean;
    project?: AppBuilderProject;
    responseMessage: string;
    error?: string;
  }> {
    const res = await fetch('/api/app-builder/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        responseMessage: err.error || 'Erreur lors de la génération du projet.',
        error: err.error,
      };
    }

    return await res.json();
  }

  // Real Deployment system: Packages project files and registers permanent public URL
  static async deployProject(params: {
    userId: string;
    userEmail?: string;
    projectId: string;
    project: AppBuilderProject;
  }): Promise<{
    success: boolean;
    publicUrl?: string;
    deployment?: ProjectDeployment;
    error?: string;
  }> {
    const res = await fetch('/api/app-builder/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.error || 'Échec du déploiement.',
      };
    }

    const data = await res.json();

    // Update local project with new deployment
    if (data.success && data.deployment) {
      const updatedProject: AppBuilderProject = {
        ...params.project,
        status: 'DEPLOYED',
        latestDeploymentUrl: data.publicUrl,
        deployments: [data.deployment, ...(params.project.deployments || [])],
        updatedAt: Date.now(),
      };
      await this.saveProject(updatedProject);
    }

    return data;
  }

  // Export full project as a standard ZIP file with README and sanitized configs
  static async exportProjectZip(project: AppBuilderProject): Promise<Blob> {
    const zip = new JSZip();

    // Add all project files
    project.files.forEach(f => {
      // Exclude secret internal configurations if any
      if (!f.path.includes('.env.local') && !f.path.includes('credentials.json')) {
        zip.file(f.path, f.content);
      }
    });

    // Ensure .env.example is present without private keys
    if (!project.files.some(f => f.path === '.env.example')) {
      zip.file(
        '.env.example',
        `# Berry GPT App Builder Environment Config
# Remplir avec vos clés d'API tierces si nécessaire
NODE_ENV=production
PORT=3000
`
      );
    }

    // Ensure comprehensive README.md is present
    if (!project.files.some(f => f.path === 'README.md')) {
      zip.file(
        'README.md',
        `# ${project.name}

${project.description || "Application construite avec Berry GPT App Builder Pro."}

## 🚀 Démarrage Rapide

1. Installez les dépendances :
\`\`\`bash
npm install
\`\`\`

2. Lancez le serveur de développement :
\`\`\`bash
npm run dev
\`\`\`

3. Compilez pour la production :
\`\`\`bash
npm run build
\`\`\`

---
*Généré par Berry GPT App Builder Pro - Créé par Desir Asaph Berry.*
`
      );
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  // Create a new snapshot version
  static createVersionSnapshot(project: AppBuilderProject, versionName?: string): AppBuilderProject {
    const nextVerNumber = (project.versions?.length || 0) + 1;
    const newVersion: ProjectVersion = {
      id: `v_${Date.now()}`,
      versionNumber: nextVerNumber,
      name: versionName || `Version ${nextVerNumber}`,
      timestamp: Date.now(),
      files: JSON.parse(JSON.stringify(project.files)),
    };

    return {
      ...project,
      versions: [newVersion, ...(project.versions || [])],
      updatedAt: Date.now(),
    };
  }

  // Restore snapshot version
  static restoreVersion(project: AppBuilderProject, versionId: string): AppBuilderProject {
    const target = project.versions.find(v => v.id === versionId);
    if (!target) return project;

    return {
      ...project,
      files: JSON.parse(JSON.stringify(target.files)),
      updatedAt: Date.now(),
    };
  }
}
