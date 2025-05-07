import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { API_URL } from "../config";
import { hashPassword } from "../helpers/password";
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let request = {
        email: email,
        password: await hashPassword(password),
      };
      console.log(request);
      let response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response);

      // if response is successful, navigate to lobby
      if (response.ok) {
        navigate("/lobby");
      } else {
        setError("Failed to login. Please check your credentials.");
      }

      navigate("/lobby");
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderRadius: 2,
            width: "100%",
            maxWidth: "400px",
            mx: "auto",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              mb: 3,
            }}
          >
            Welcome to UNO
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: "1.1rem",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <Typography
            align="center"
            sx={{
              mt: 3,
              color: "text.secondary",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Register here
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
