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
			body{padding:2%}
			{{{${key}.style}}}
		</style>
	</head>
	<body>
		${content}
	</body>
</html>`;
};
