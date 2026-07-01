// ----------------------------------------------------------------------

const parseJsonField = (value) => {
	// null / undefined
	if (value == null) return value;

	// Already Object or Array
	if (typeof value === "object") {
		return value;
	}

	// String
	if (typeof value === "string") {
		try {
			// Try parsing
			const parsed = JSON.parse(value);

			// If parsed is object/array return it
			if (typeof parsed === "object") {
				return parsed;
			}

			// Parsed primitive (number, boolean, etc.)
			return parsed;
		} catch (err) {
			// Not JSON, return original string
			return value;
		}
	}

	return value;
};

module.exports = {
	parseJsonField,
};
