import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CardUI from '../components/CardUI';
import Dashboard from '../components/Dashboard';
const CardPage = () => {
    return (
        <div>
            <PageTitle />
            <LoggedInName />
            <CardUI />
            <Dashboard />
        </div>
    );
}
export default CardPage;