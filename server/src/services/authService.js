import jwt from "jsonwebtoken";

class AuthService {
  constructor() {
    this.users = new Map();
  }

  createUser(userData) {
    const { name, email, isAdmin = false } = userData;

    if (!name || !email) {
      throw new Error("Name and email are required");
    }

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isAdmin: Boolean(isAdmin),
      loginTime: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    return user;
  }

  getUserById(userId) {
    return this.users.get(userId) || null;
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
}

export default new AuthService();
