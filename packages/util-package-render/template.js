module.exports = (key, content) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>{{${key}.title}}</title>
		<script>
			{{${key}.script}}
		</script>
		<style>
			{{${key}.style}}
		</style>
	</head>
	<body>
		${content}
	</body>
</html>`;
};
