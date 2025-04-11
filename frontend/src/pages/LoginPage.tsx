import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import Register from '../components/Register.tsx';
import CardUI from '../components/CardUI.tsx';
//import ForgotPass from './ForgotPassPage.tsx';

const LoginPage = () => {
    return (
        <div>
            <PageTitle />
            <Login />
            <Register />
        </div>
    );
};
export default LoginPage;