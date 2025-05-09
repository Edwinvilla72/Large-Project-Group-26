import { motion } from 'framer-motion'; // to animate pages ooooooo

function LoggedInName() {
    // user variables
    var _ud = localStorage.getItem('user_data');
    if (_ud == null) _ud = "";
    var ud = JSON.parse(_ud);
    var userId = ud._id;
    var firstName = ud.FirstName;
    var lastName = ud.LastName;

    // logout function
    function doLogout(event: any): void {
        event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };

    // additions to the page which includes the users first and last name (adds a log out button)
    return (
        <>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span id="userName">Welcome back, {firstName} {lastName}!</span><br />
          </motion.div>
      
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              type="button"
              id="logoutButton"
              className="buttons"
              onClick={doLogout}
            >
              Log Out
            </button>
          </motion.div>
        </>
      );
      
};
export default LoggedInName;