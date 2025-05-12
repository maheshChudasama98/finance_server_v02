module.exports = {
	DevelopMood: true,
	ProjectName: "Smart Analyst FV2",
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

	AllMonths: [
		{month: 1, monthName: "Jan"},
		{month: 2, monthName: "Feb"},
		{month: 3, monthName: "Mar"},
		{month: 4, monthName: "Apr"},
		{month: 5, monthName: "May"},
		{month: 6, monthName: "Jun"},
		{month: 7, monthName: "Jul"},
		{month: 8, monthName: "Aug"},
		{month: 9, monthName: "Sep"},
		{month: 10, monthName: "Oct"},
		{month: 11, monthName: "Nov"},
		{month: 12, monthName: "Dec"},
	],
};
