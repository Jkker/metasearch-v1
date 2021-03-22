import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
const queryString = require('query-string');
const useQuery = function (defaultValues = {}) {
	const { pathname, search } = useLocation();
	const history = useHistory();
	const query = queryString.parse(search);
	const updateQuery = useCallback(
		function (updatedParams) {
			const newQuery = Object.assign({}, query, updatedParams);
			history.push(pathname + '?' + queryString.stringify(newQuery));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[query, pathname, history]
	);
	const queryWithDefault = useMemo(
		function () {
			return Object.assign({}, defaultValues, query);
		},
		[query, defaultValues]
	);
	return [queryWithDefault, updateQuery];
};

export default useQuery;
