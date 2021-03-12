import postscribe from 'postscribe';
import { useEffect } from 'react';
const useWeather = (mountPoint: string) => {
	useEffect(() => {
		postscribe(
			mountPoint,
			`
<div id="weather-v2-plugin-simple"></div>
<script>
WIDGET = {
  CONFIG: {
    "modules": "01234",
    "background": 5,
    "tmpColor": "4A4A4A",
    "tmpSize": 16,
    "cityColor": "4A4A4A",
    "citySize": 16,
    "aqiSize": 16,
    "weatherIconSize": 24,
    "alertIconSize": 18,
    "padding": "10px 10px 10px 10px",
    "shadow": "0",
    "language": "auto",
    "fixed": "true",
    "vertical": "middle",
    "horizontal": "center",
    "left": "15",
    "top": "15",
    "key": "ydv69AmsJg"
  }
}
</script>
<script src="https://apip.weatherdt.com/simple/static/js/weather-simple-common.js?v=2.0"></script>
`
		);
	}, [mountPoint]);
};

export default useWeather;
