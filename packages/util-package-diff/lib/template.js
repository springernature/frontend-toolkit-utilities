// HTML template wrapper
module.exports = (remoteHtml, localHtml) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<script>
    		(function(e){var t=e.documentElement,n=e.implementation;t.className='js';})(document)
		</script>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>example</title>
	</head>
	<body style="padding:2%">
		<iframe height="100%" id="demo-container" title="thing" scrolling="auto" allowtransparency="true" loading="lazy" srcdoc='${remoteHtml}' frameborder="0"></iframe>
		<iframe height="100%" id="demo-container" title="thing" scrolling="auto" allowtransparency="true" loading="lazy" srcdoc='${localHtml}' frameborder="0"></iframe>
	</body>
</html>`;
};
