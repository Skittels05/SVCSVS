import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useNavigate,Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(formData));
        if (login.fulfilled.match(result)) {
            navigate('/');
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit}>
                <h2>Вход</h2>
                {error && <div className="error">{error}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
                <p>
                    Нет аккаунта? <a href="/register">Регистрация</a>
                </p>
                <p className="auth-link">
                    Забыли пароль? <Link to="/forgot-password">Восстановить</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;