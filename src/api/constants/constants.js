module.exports = {
	DevelopMood: true,
	ProjectName: "Analyst FV2",
	resetLink: "http://www.smartsdn.in:8000/login",
	loginLink: "http://www.smartsdn.in:8000/login",

	superAdminRoleId: 1,

	//Image path set here
	OrgImagePath: "orgs",
	BranchImagePath: "branches",
	UserProfileImagePath: "users",

	//Regex value set here
	PasswordRegex: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])(?=\S+$).{8,}$/,
    
	MonthsArray: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
