import React, { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Button, Select, MenuItem, TextField, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const options = { withCredentials: true };
    const handleChange = (event) => {
        setRole(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Both email and password are required.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/user/login", {
                email,
                password,
                role,
            },options);

            toast.success("Login successful!", {
                autoClose: 5000
              });
            localStorage.setItem("authToken", response.data.token);
            window.location.href = "/dashboard";

        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data.message || "An error occurred during login.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="w-screen h-screen items-center justify-center flex">
            <ToastContainer />
            <form
                className="self-center mx-10 mt-6 space-y-4 flex flex-col justify-center items-center lg:h-4/5 lg:w-1/4 w-2/3 h-3/4 border border-neutral-900 rounded-2xl p-10"
                onSubmit={handleSubmit}
            >
                <h2>Login</h2>
                <FormControl className="lg:w-5/6">
                    <InputLabel id="role-select-label">Role</InputLabel>
                    <Select
                        labelId="role-select-label"
                        value={role}
                        onChange={handleChange}
                    >
                        <MenuItem value="Banker">Banker</MenuItem>
                        <MenuItem value="Customer">Customer</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Enter Email Id"
                    variant="outlined"
                    onChange={(e) => setEmail(e.target.value)}
                    className="lg:w-5/6"
                />
                <TextField
                    label="Enter Password"
                    variant="outlined"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="lg:w-5/6"
                />
                Forgot Password?
                <Button
                    variant="contained"
                    className="border border-neutral-900 w-44 h-9 text-xl"
                    type="submit"
                >
                    Login
                </Button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default Login;
