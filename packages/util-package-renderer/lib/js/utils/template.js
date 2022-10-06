// HTML template wrapper
module.exports = (key, content) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<script>
    		(function(e){var t=e.documentElement,n=e.implementation;t.className='js';})(document)
		</script>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
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
