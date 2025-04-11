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
        <div id="loggedInDiv">
            <span id="userName">Welcome back, {firstName} {lastName}!</span><br />
            <button type="button" id="logoutButton" className="buttons"
                onClick={doLogout}> Log Out </button>
        </div>
    );
};
export default LoggedInName;