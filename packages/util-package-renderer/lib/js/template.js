// HTML template wrapper
module.exports = (key, content) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>{{${key}.title}}</title>
		<script type="module">
			{{{${key}.script}}}
		</script>
		<style>
			/* demo page styles */
			body{padding:2%}
		</style>
		<style>
			{{{${key}.style}}}
		</style>
	</head>
	<body>
		${content}
	</body>
</html>`;
};
