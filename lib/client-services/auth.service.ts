export class AuthService {
    private isAuthenticated = false;

    login(username: string, password: string): boolean {
        // Simple check for demonstration purposes
        if (username === 'admin' && password === 'password') {
            this.isAuthenticated = true;
            return true;
        }
        this.isAuthenticated = false;
        return false;
    }

    logout(): void {
        this.isAuthenticated = false;
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }
}