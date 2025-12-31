// API Helper Functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

interface UserData {
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

interface ResumeData {
  title: string;
  template: string;
  data: Record<string, unknown>;
}

interface PortfolioData {
  title: string;
  template: string;
  data: Record<string, unknown>;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "An error occurred",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth endpoints
  async signUp(email: string, password: string, userData: UserData) {
    const name = `${userData.firstName} ${userData.lastName}`.trim();
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        acceptTerms: userData.acceptTerms,
      }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request("/auth/signout", {
      method: "POST",
    });
  }

  // Resume endpoints
  async getResumes() {
    return this.request("/resumes");
  }

  async createResume(resumeData: ResumeData) {
    return this.request("/resumes", {
      method: "POST",
      body: JSON.stringify(resumeData),
    });
  }

  async updateResume(id: string, resumeData: ResumeData) {
    return this.request(`/resumes/${id}`, {
      method: "PUT",
      body: JSON.stringify(resumeData),
    });
  }

  async deleteResume(id: string) {
    return this.request(`/resumes/${id}`, {
      method: "DELETE",
    });
  }

  // Portfolio endpoints
  async getPortfolios() {
    return this.request("/portfolios");
  }

  async createPortfolio(portfolioData: PortfolioData) {
    return this.request("/portfolios", {
      method: "POST",
      body: JSON.stringify(portfolioData),
    });
  }

  // ATS endpoints
  async checkATS(resumeFile: File) {
    const formData = new FormData();
    formData.append("resume", resumeFile);

    return this.request("/ats/check", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  // Credit endpoints
  async getCredits() {
    return this.request("/credits");
  }

  async purchaseCredits(packageId: string) {
    return this.request("/credits/purchase", {
      method: "POST",
      body: JSON.stringify({ packageId }),
    });
  }
}

export const api = new ApiClient();
export default api;
