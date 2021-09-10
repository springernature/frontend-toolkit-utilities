// HTML template wrapper
module.exports = (key, content) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>{{${key}.title}}</title>
		<style>
			{{{${key}.style}}}
		</style>
	</head>
	<body style="padding:2%">
		${content}
		<script>
			{{{${key}.script}}}
		</script>
	</body>
</html>`;
};
