import { Response, Router } from 'express';
import { User } from '../../db/schema';
import bcrypt from 'bcrypt';
import { UserInstance, AuthenticatedRequest, AuthenticatedRequestHandler } from '../../types';


const signinHandler: AuthenticatedRequestHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({ error: 'Missing username or password' });
            return;
        }

        // Find user by username
        const user = await User.findOne({
            where: { username }
        }) as UserInstance | null;

        if (!user) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            game_id: user.game_id
        };

        // Return success response (excluding password hash)
        const { password_hash, ...userWithoutPassword } = user.toJSON();
        res.status(200).json({
            message: 'Sign in successful',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const signoutHandler: AuthenticatedRequestHandler = (req, res) => {
    req.session.destroy((err: Error | null) => {
        if (err) {
            console.error('Signout error:', err);
            res.status(500).json({ error: 'Error signing out' });
            return;
        }
        res.status(200).json({ message: 'Signed out successfully' });
    });
};

export { signinHandler, signoutHandler };
