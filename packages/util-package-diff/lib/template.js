// HTML template wrapper
module.exports = (remote, local) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<script>
    		(function(e){var t=e.documentElement,n=e.implementation;t.className='js';})(document)
		</script>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>example</title>
		<style>
			.flex-container {
				display: flex;
			}
			.flex-child {
				flex: 1;
			}
		</style>
	</head>
	<body style="padding:2%">
			<h1>Visual diff</h1>
		<div class="flex-container">
			<div class="flex-child">
				<h2>${remote.name} v${remote.version}</h2>
				<iframe height="100%" width="100%" title="thing" scrolling="auto" allowtransparency="true" loading="lazy" srcdoc='${remote.html}' frameborder="0"></iframe>
			</div>
			<div class="flex-child">
				<h2>${local.name} v${local.version}</h2>
				<iframe height="100%" width="100%" title="thing" scrolling="auto" allowtransparency="true" loading="lazy" srcdoc='${local.html}' frameborder="0"></iframe>
			</div>
		</div>
	</body>
</html>`;
};
