const { ProjectName } = require("./constants");

require("dotenv").config();

module.exports.defaultOrgDetails = {
	OrgName: process.env.DEFAULT_ORG || "Default ORG",
	Description: "Default Owner",
};

module.exports.defaultBranchDetails = {
	BranchName: "Main Branch",
	Description: "Your Org main Main Branch",
	Address: "",
	City: "",
	State: "",
	GstNumber: "",
	Phone: "",
	Email: "",
};

module.exports.roleList = [
	{RoleName: "Super Admin", Description: "All Right have all Owner"},
	{RoleName: "Owner", Description: "All Right have Owner"},
	{RoleName: "Branch Admin", Description: "All Right have base branch"},
	{RoleName: "User", Description: "Branch user"},
];

module.exports.modulesList = [
	{
		ModulesName: "Dashboard",
		Description: "Dashboard details",
		Router: "/dashboard",
		Icon: "fa-solid fa-table-columns",
	},
	{
		ModulesName: "Record",
		Description: "Manage role read and write access",
		Router: "/records",
		Icon: "fa-solid fa-list-ul",
	},
	{
		ModulesName: "Accounts",
		Description: "Manage",
		Router: "/accounts",
		Icon: "fa-solid fa-server",
	},
	{
		ModulesName: "Party",
		Description: "Manage party details",
		Router: "/parties",
		Icon: "fa-solid fa-users",
	},
	{
		ModulesName: "Categories",
		Description: "Manage categories",
		Router: "/categories",
		Icon: "fa-solid fa-icons",
	},
	{
		ModulesName: "Labels",
		Description: "Manage labels",
		Router: "/labels",
		Icon: "fa-solid fa-tags",
	},
	{
		ModulesName: "Org",
		Description: "Manage organization details",
		Router: "/orgs",
		Icon: "fa-solid fa-sitemap",
	},
	{
		ModulesName: "Branches",
		Description: "Manage branch details",
		Router: "/branches",
		Icon: "fa-solid fa-code-branch",
	},
	{
		ModulesName: "Modules",
		Description: "Manage module permissions",
		Router: "/modules",
		Icon: "fa-solid fa-server",
	},
	{
		ModulesName: "Roles",
		Description: "Manage user roles and permissions",
		Router: "/roles",
		Icon: "fa-solid fa-masks-theater",
	},
	{
		ModulesName: "Users",
		Description: "Manage user accounts",
		Router: "/users",
		Icon: "fa-solid fa-user",
	},
	{
		ModulesName: "Setting",
		Description: "Manage Setting ",
		Router: "/setting",
		Icon: "fa-solid fa-cog",
	},
	{
		ModulesName: "Analytics",
		Description: "Analytics ",
		Router: "/analytics",
		Icon: "fa-solid fa-chart-pie",
	},
];

module.exports.defaultCategoryList = [
	{
		CategoryName: "Food & Drinks",
		Icon: "fa-solid fa-utensils",
		Color: "#f44336",
		Description: "All expenses related to food, drinks, and dining out.",
		Child: [
			{
				SubCategoriesName: "Bar, Cafe",
				Icon: "fa-solid fa-champagne-glasses",
				Description: "Spending at bars, cafes, and coffee shops.",
			},
			{
				SubCategoriesName: "Cold Drink",
				Icon: "fa-solid fa-whiskey-glass",
				Description: "Purchases of soft drinks, juices, and alcoholic beverages.",
			},
			{
				SubCategoriesName: "Restaurant & Fast-food",
				Icon: "fa-solid fa-bell-concierge",
				Description: "Eating out at restaurants, fast food joints, and takeaways.",
			},
			{
				SubCategoriesName: "Groceries",
				Icon: "fa-solid fa-basket-shopping",
				Description: "Purchases of food and household essentials from stores.",
			},
		],
	},
	{
		CategoryName: "Shopping",
		Icon: "fa-solid fa-bag-shopping",
		Color: "#4fc3f7",
		Description: "Expenses related to buying clothes, electronics, and personal items.",
		Child: [
			{
				SubCategoriesName: "Clothes & Shoes",
				Icon: "fa-solid fa-shirt",
				Description: "Purchasing apparel and footwear.",
			},
			{
				SubCategoriesName: "Electronics, Accessories",
				Icon: "fa-solid fa-plug-circle-bolt",
				Description: "Buying gadgets, electronics, and accessories.",
			},
			{
				SubCategoriesName: "Gifts, Joy",
				Icon: "fa-solid fa-gifts",
				Description: "Expenses on gifts, celebrations, and surprises.",
			},
			{
				SubCategoriesName: "Health & Beauty",
				Icon: "fa-solid fa-receipt",
				Description: "Purchasing beauty products and wellness items.",
			},
			{
				SubCategoriesName: "Home, Garden",
				Icon: "fa-solid fa-house-chimney",
				Description: "Expenses for home improvement and gardening.",
			},
			{
				SubCategoriesName: "Jewels, Accessories",
				Icon: "fa-regular fa-gem",
				Description: "Buying jewelry and fashion accessories.",
			},
			{
				SubCategoriesName: "Kids",
				Icon: "fa-solid fa-baby-carriage",
				Description: "Purchases for children, including toys and baby products.",
			},
			{
				SubCategoriesName: "Pets, Animals",
				Icon: "fa-solid fa-paw",
				Description: "Expenses related to pet care, food, and accessories.",
			},
			{
				SubCategoriesName: "Stationery, Tools",
				Icon: "fa-solid fa-toolbox",
				Description: "Buying office supplies, stationery, and tools.",
			},
		],
	},
	{
		CategoryName: "Housing",
		Icon: "fa-solid fa-house-user",
		Color: "#EDAE00",
		Description: "All expenses related to housing, rent, and utilities.",
		Child: [
			{
				SubCategoriesName: "Energy, Utilities",
				Icon: "fa-solid fa-bolt",
				Description: "Electricity, gas, water, and other utility bills.",
			},
			{
				SubCategoriesName: "Maintenance, Repairs",
				Icon: "fa-solid fa-hammer",
				Description: "Expenses for home maintenance and repair works.",
			},
			{
				SubCategoriesName: "Mortgage",
				Icon: "fa-solid fa-home",
				Description: "Payments related to home loans and mortgages.",
			},
			{
				SubCategoriesName: "Property insurance",
				Icon: "fa-solid fa-house-fire",
				Description: "Insurance expenses for home and property protection.",
			},
			{
				SubCategoriesName: "Rent",
				Icon: "fa-solid fa-key",
				Description: "Monthly payments for rented accommodations.",
			},
			{
				SubCategoriesName: "Services",
				Icon: "fa-solid fa-gear",
				Description: "Housing-related services like cleaning and security.",
			},
		],
	},
	{
		CategoryName: "Transportation",
		Icon: "fa-solid fa-truck-plane",
		Color: "#0693E3",
		Description: "This category covers various modes of transportation, including business travel, long-distance travel, and public transport options.",
		Child: [
			{
				SubCategoriesName: "Business Trips",
				Icon: "fa-solid fa-suitcase",
				Description: "Covers transportation methods used for corporate travel, meetings, and work-related trips.",
			},
			{
				SubCategoriesName: "Long Distance",
				Icon: "fa-solid fa-plane-departure",
				Description: "Includes travel options for long-distance journeys, such as flights, intercity buses, and road trips.",
			},
			{
				SubCategoriesName: "Public Transport",
				Icon: "fa-solid fa-bus",
				Description: "Encompasses buses, trams, and other shared public transportation systems available for daily commuting.",
			},
			{
				SubCategoriesName: "Rail Way",
				Icon: "fa-solid fa-train-subway",
				Description: "Covers train and subway systems used for urban and long-distance commuting.",
			},
			{
				SubCategoriesName: "Taxi",
				Icon: "fa-solid fa-taxi",
				Description: "Includes taxis, ride-sharing services, and private car hires for short-distance travel.",
			},
		],
	},
	{
		CategoryName: "Vehicle",
		Icon: "fa-solid fa-car",
		Color: "#9900EF",
		Description: "Covers expenses and services related to vehicle ownership and usage.",
		Child: [
			{
				SubCategoriesName: "Fuel",
				Icon: "fa-solid fa-gas-pump",
				Description: "Expenses for gasoline, diesel, or electric charging.",
			},
			{
				SubCategoriesName: "Parking",
				Icon: "fa-solid fa-square-parking",
				Description: "Costs for parking spaces, garages, and meters.",
			},
			{
				SubCategoriesName: "Vehicle Insurance",
				Icon: "fa-solid fa-car-burst",
				Description: "Covers vehicle insurance policies and premiums.",
			},
			{
				SubCategoriesName: "Vehicle Maintenance",
				Icon: "fa-solid fa-screwdriver-wrench",
				Description: "Costs for servicing, repairs, and upkeep.",
			},
		],
	},
	{
		CategoryName: "Life & Entertainment",
		Icon: "fa-solid fa-person",
		Color: "#008B02",
		Description: "Covers activities, hobbies, and experiences that enhance life and entertainment.",
		Child: [
			{
				SubCategoriesName: "Active Sport, Fitness",
				Icon: "fa-solid fa-dumbbell",
				Description: "Expenses for gym memberships, sports, and fitness activities.",
			},
			{
				SubCategoriesName: "Books, Audio, Subscriptions",
				Icon: "fa-solid fa-book-open",
				Description: "Costs for books, audiobooks, and digital subscriptions.",
			},
			{
				SubCategoriesName: "Charity, Gifts",
				Icon: "fa-solid fa-gift",
				Description: "Donations, gifts, and charitable contributions.",
			},
			{
				SubCategoriesName: "Culture, Sport Events",
				Icon: "fa-solid fa-ticket",
				Description: "Tickets for concerts, theater, and sports events.",
			},
			{
				SubCategoriesName: "Education, Development",
				Icon: "fa-solid fa-chalkboard-user",
				Description: "Courses, workshops, and skill development programs.",
			},
			{
				SubCategoriesName: "Hobbies",
				Icon: "fa-solid fa-heart",
				Description: "Expenses for personal hobbies and creative activities.",
			},
			{
				SubCategoriesName: "Holiday, Trips, Hotels",
				Icon: "fa-solid fa-suitcase-rolling",
				Description: "Travel, vacations, and accommodation costs.",
			},
			{
				SubCategoriesName: "Life Events",
				Icon: "fa-solid fa-cake-candles",
				Description: "Expenses for weddings, birthdays, and special occasions.",
			},
			{
				SubCategoriesName: "Lottery, Gambling",
				Icon: "fa-solid fa-dice",
				Description: "Spending on lottery tickets, casinos, and betting.",
			},
			{
				SubCategoriesName: "TV, Streaming",
				Icon: "fa-solid fa-tv",
				Description: "Subscription costs for streaming and television services.",
			},
			{
				SubCategoriesName: "Wellness, Beauty",
				Icon: "fa-solid fa-spa",
				Description: "Costs for spa, skincare, and self-care treatments.",
			},
		],
	},
	{
		CategoryName: "Communication, PC",
		Icon: "fa-solid fa-desktop",
		Color: "#ff6900",
		Description: "Covers expenses related to communication, internet, and digital services.",
		Child: [
			{
				SubCategoriesName: "Internet",
				Icon: "fa-solid fa-wifi",
				Description: "Costs for broadband, Wi-Fi, and mobile data services.",
			},
			{
				SubCategoriesName: "Phone, Cell-Phone",
				Icon: "fa-solid fa-mobile-screen-button",
				Description: "Expenses for mobile plans, calls, and phone purchases.",
			},
			{
				SubCategoriesName: "Postal Service",
				Icon: "fa-solid fa-envelopes-bulk",
				Description: "Costs for mail, courier services, and shipping.",
			},
			{
				SubCategoriesName: "Software, Apps, Games",
				Icon: "fa-solid fa-puzzle-piece",
				Description: "Spending on apps, games, and software subscriptions.",
			},
		],
	},
	{
		CategoryName: "Financial Expenses",
		Icon: "fa-solid fa-coins",
		Color: "#00D084",
		Description: "Covers various financial obligations, including fees, loans, and taxes.",
		Child: [
			{
				SubCategoriesName: "Advisory",
				Icon: "fa-solid fa-user-tie",
				Description: "Expenses for financial, legal, and investment advice.",
			},
			{
				SubCategoriesName: "Charges, Fees",
				Icon: "fa-solid fa-file-invoice",
				Description: "Bank fees, service charges, and administrative costs.",
			},
			{
				SubCategoriesName: "Child Support",
				Icon: "fa-solid fa-hands-holding-child",
				Description: "Payments related to child support and care.",
			},
			{
				SubCategoriesName: "Fines",
				Icon: "fa-solid fa-gavel",
				Description: "Legal fines, penalties, and traffic violation fees.",
			},
			{
				SubCategoriesName: "Insurances",
				Icon: "fa-solid fa-house-crack",
				Description: "Premiums for health, life, property, and other insurances.",
			},
			{
				SubCategoriesName: "Loan, Interests",
				Icon: "fa-solid fa-hand-holding-dollar",
				Description: "Repayments on loans, mortgages, and interest charges.",
			},
			{
				SubCategoriesName: "Taxes",
				Icon: "fa-solid fa-receipt",
				Description: "Government taxes, income tax, and property tax payments.",
			},
		],
	},
	{
		CategoryName: "Investments",
		Icon: "fa-solid fa-chart-line",
		Color: "#0073E6",
		Description: "Covers various types of investments, including financial assets, real estate, and savings.",
		Child: [
			{
				SubCategoriesName: "Collections",
				Icon: "fa-solid fa-gem",
				Description: "Investments in valuable collectibles like art, coins, and antiques.",
			},
			{
				SubCategoriesName: "Financial Investments",
				Icon: "fa-solid fa-sack-dollar",
				Description: "Stocks, bonds, mutual funds, and other financial instruments.",
			},
			{
				SubCategoriesName: "Realty",
				Icon: "fa-solid fa-building",
				Description: "Investments in real estate, including properties and land.",
			},
			{
				SubCategoriesName: "Savings",
				Icon: "fa-solid fa-piggy-bank",
				Description: "Funds saved in bank accounts, fixed deposits, and emergency funds.",
			},
			{
				SubCategoriesName: "Vehicles, Chattels",
				Icon: "fa-solid fa-car",
				Description: "Investments in cars, boats, and other valuable personal assets.",
			},
		],
	},
	{
		CategoryName: "Income",
		Icon: "fa-solid fa-money-bill-wave",
		Color: "#28A745",
		Description: "Tracks all sources of income, including salary, gifts, and sales.",
		Child: [
			{
				SubCategoriesName: "Gifts",
				Icon: "fa-solid fa-gift",
				Description: "Money or assets received as gifts.",
			},
			{
				SubCategoriesName: "Salary",
				Icon: "fa-solid fa-briefcase",
				Description: "Earnings from employment and regular wages.",
			},
			{
				SubCategoriesName: "Sale",
				Icon: "fa-solid fa-tags",
				Description: "Income from selling goods, property, or assets.",
			},
		],
	},
	{
		CategoryName: "Health & Hospital",
		Icon: "fa-solid fa-hospital-user",
		Color: "#DC3545",
		Description: "Covers medical expenses, doctor visits, and treatments.",
		Child: [
			{
				SubCategoriesName: "Doctor Fees",
				Icon: "fa-solid fa-user-doctor",
				Description: "Payments for medical consultations and check-ups.",
			},
			{
				SubCategoriesName: "Reports",
				Icon: "fa-solid fa-clipboard-list",
				Description: "Expenses for medical tests, reports, and diagnostics.",
			},
			{
				SubCategoriesName: "Medisign",
				Icon: "fa-solid fa-tablets",
				Description: "Cost of medicines, prescriptions, and supplements.",
			},
		],
	},
	{
		CategoryName: "Others",
		Icon: "fa-solid fa-ellipsis",
		Color: "#6C757D",
		Description: "Miscellaneous expenses that do not fit other categories.",
		Child: [
			{
				SubCategoriesName: "Missing",
				Icon: "fa-solid fa-question-circle",
				Description: "Uncategorized or unexpected expenses.",
			},
		],
	},
];

module.exports.emailList = [
	{
		Type: "email",
		Title: "Server Restarted",
		Subject: "Server Restarted",
		Content: `<p><strong>Time:</strong>{__RestartedTime__}</p><p><strong>Project:</strong>{__ProjectName__}</p><p><strong>Port:</strong>{__ServerPort__}</p><p><strong>Database:</strong>{__DatabaseName__}</p><p><strong>URl:</strong>{__DefaultUrl__}</p>`,
		Slug: "server_restarted",
	},
	{
		Type: "email",
		Title: `Welcome to ${ProjectName} Registration Successful`,
		Subject: "Registration",
		Content: `<p>Hello <strong>{__FirstName__} {__LastName__}</strong>,</p> <p>You have been added to our system. Here are your login details:</p><p><strong>Email:</strong>{__UserEmail__}</p><p><strong>Temporary Password:</strong></p><div style="background-color: #f4f4f9; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 18px; font-weight: bold; text-align: center; color: #333; margin-bottom: 20px;">{__TemporaryPassword__}</div> <p>If you wish to change your password, please click the button below:</p> <p style="text-align: center;"> <a href="{__LoginLink__}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Change Password</a> </p> <p>If you did not request this, you can ignore this email.</p> <p>Thank you,<br>The Team</p>`,
		Slug: "registration",
	},
	{
		Type: "email",
		Title: `Monthly Transaction Statement for {__MonthYear__}`,
		Subject: "Your Monthly Financial Summary",
		Content: `
			<p style="font-family: Arial, sans-serif; line-height: 1.6;">Dear <strong>{__UserName__}</strong>,</p>
			<p style="font-family: Arial, sans-serif; line-height: 1.6;">Here is your transaction summary for <strong>{__MonthYear__}</strong>.</p>
	
			<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif;">
				<tr style="background-color: #f2f2f2;">
					<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Category</th>
					<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Amount (₹)</th>
				</tr>
				<tr>
					<td style="padding: 10px; border: 1px solid #ddd;">Income</td>
					<td style="padding: 10px; border: 1px solid #ddd;">{__Income__}</td>
				</tr>
				<tr>
					<td style="padding: 10px; border: 1px solid #ddd;">Expense</td>
					<td style="padding: 10px; border: 1px solid #ddd;">{__Expense__}</td>
				</tr>
				<tr>
					<td style="padding: 10px; border: 1px solid #ddd;">Investment</td>
					<td style="padding: 10px; border: 1px solid #ddd;">{__Investment__}</td>
				</tr>
				<tr>
					<td style="padding: 10px; border: 1px solid #ddd;">Credit</td>
					<td style="padding: 10px; border: 1px solid #ddd;">{__Credit__}</td>
				</tr>
				<tr>
					<td style="padding: 10px; border: 1px solid #ddd;">Debit</td>
					<td style="padding: 10px; border: 1px solid #ddd;">{__Debit__}</td>
				</tr>
			</table>
	
			<p style="font-family: Arial, sans-serif; line-height: 1.6; margin-top: 30px;">Thank you,<br>The Team</p>
		`,
		Slug: "monthly-transaction-summary",
	},
];
