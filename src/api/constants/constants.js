module.exports = {
	DevelopMood: true,
	ProjectName: "AnalystData",
	resetLink: "http://localhost:3030/modules",

	superAdminRoleId: 1,

	//Image path set here
	OrgImagePath: "orgs",
	BranchImagePath: "branches",
	UserProfileImagePath: "users",

	//Regex value set here
	PasswordRegex: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])(?=\S+$).{8,}$/,
    
	MonthsArray: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
