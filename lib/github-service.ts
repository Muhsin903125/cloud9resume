
export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.github.com${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       throw new Error(errorData.message || `GitHub API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUser(): Promise<GitHubUser> {
    return this.request('/user');
  }

  async createRepo(name: string, description: string = 'Portfolio created by Cloud9 Resume') {
    // Check if repo exists first? The API will error if it exists.
    try {
      return await this.request('/user/repos', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          private: false, // Pages usually need to be public for free usage
          auto_init: true,
        })
      });
    } catch (e: any) {
      if (e.message.includes('name already exists')) {
        // Retrieve it instead
        const user = await this.getUser();
        return this.request(`/repos/${user.login}/${name}`);
      }
      throw e;
    }
  }

  async uploadFile(owner: string, repo: string, path: string, content: string, message: string = 'Update portfolio') {
    // 1. Get current SHA if file exists
    let sha;
    try {
        const file = await this.request(`/repos/${owner}/${repo}/contents/${path}`);
        sha = file.sha;
    } catch (e) {
        // File doesn't exist, which is fine
    }

    // 2. Encode content to Base64
    // Note: Buffer is a Node.js API. In browser we use btoa/TextEncoder or similar.
    // Assuming this runs in browser or Node environment that supports Buffer or we polyfill.
    // 'window' check for browser safe.
    let contentEncoded;
    if (typeof window !== 'undefined') {
       contentEncoded = btoa(unescape(encodeURIComponent(content))); 
    } else {
       contentEncoded = Buffer.from(content).toString('base64');
    }

    // 3. Create/Update file
    return await this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: contentEncoded,
        sha // Include sha if updating
      })
    });
  }

  async enablePages(owner: string, repo: string) {
    try {
        return await this.request(`/repos/${owner}/${repo}/pages`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.switcheroo-preview+json'
            },
            body: JSON.stringify({
                source: {
                    branch: 'main',
                    path: '/'
                }
            })
        });
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            return; // Already enabled
        }
        // Might be that the branch 'main' doesn't exist yet if we just created repo?
        // Usually auto_init=true creates 'main'.
        throw e;
    }
  }
}
