module.exports = content => {
return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>{{title}}</title>
		<script>
			{{script}}
		</script>
		<style>
			{{style}}
		</style>
	</head>
	<body>
		${content}
	</body>
</html>`
};
