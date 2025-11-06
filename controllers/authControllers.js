import { v4 as uuidv4 } from "uuid";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import userSchema from "../schemas/userSchema.js";
import { genSalt, hash, compare } from "bcryptjs";
import {
  createTable,
  checkRecordExists,
  insertRecord,
  deleteRecord, //ces fonctions m'aident a gerer la creation la suppression et la conformité des users😘
} from "../utils/sqlFunctions.js";

const generateAccessToken = (userId) => {
  return sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ error: "Email or Password fields cannot be empty!" });
    return;
  }
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const user = {
    userId: uuidv4(),
    email,
    password: hashedPassword,
  };
  try {
    await createTable(userSchema);
    const userAlreadyExists = await checkRecordExists("users", "email", email);
    if (userAlreadyExists) {
      res.status(409).json({ error: "Email already exists" });
    } else {
      await insertRecord("users", user);
      res.status(201).json({ message: "User created successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ error: "Email or Password fields cannot be empty!" });
    return;
  }

  try {
    const existingUser = await checkRecordExists("users", "email", email);

    if (existingUser) {
      if (!existingUser.password) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const passwordMatch = await compare(password, existingUser.password);

      if (passwordMatch) {
        res.status(200).json({
          userId: existingUser.userId,
          email: existingUser.email,
          access_token: generateAccessToken(existingUser.userId),
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.Id;

  if (!userId) {
    return res.status(400).json({
      error: "L'ID utilisateur est manquant dans les paramètres de la requête.",
    });
  }

  try {
    // 1. on Vérifie que l'user existe effecticement
    const userExists = await checkRecordExists("users", "userId", userId);

    if (!userExists) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // 2. Tenter la suppression
    const result = await deleteRecord("users", "userId", userId);

    // 3. Confirmation de suppression
    if (result.affectedRows > 0) {
      res.status(200).json({
        message: `Utilisateur ${userId} supprimé avec succès.`,
        affectedRows: result.affectedRows,
      });
    } else {
      // Cas d'erreur où la DB n'a rien supprimé (redondant avec la vérification d'existence, mais sécurisant)
      res.status(404).json({
        error:
          "Échec de la suppression, utilisateur non trouvé dans la base de données.",
      });
    }
  } catch (error) {
    // Gestion centralisée des erreurs serveur
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  register,
  login,
  deleteUser,
};
