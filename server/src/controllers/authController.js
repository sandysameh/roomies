import authService from "../services/authService.js";

class AuthController {
  async login(req, res) {
    try {
      const { name, email, isAdmin } = req.body;
      const user = authService.createUser({ name, email, isAdmin });
      const token = authService.generateToken(user);

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);

      if (error.message === "Name and email are required") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Login failed" });
    }
  }
  async getMe(req, res) {
    try {
      const user = authService.getUserById(req.user.id);
      console.log("User:", user);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  }

  async logout(req, res) {
    try {
      console.log("Logging out user:", req.user.id);
      authService.removeUser(req.user.id);
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  }
}

export default new AuthController();
