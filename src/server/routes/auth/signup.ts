import { Request, Response, Router, RequestHandler } from 'express';
import { User } from '../../db/schema';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';


const signupHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            res.status(400).json({ error: 'Username or email already exists' });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password_hash: passwordHash
        });

        // Return success response (excluding password hash)
        const { password_hash, ...userWithoutPassword } = newUser.toJSON();
        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



export default signupHandler; 