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
			html,
			body {
				height: 100%;
				margin: 0;
				box-sizing: border-box;
			}
			body {
				padding: 2%;
			}
			html {
				font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif;
			}
			h2 {
				margin: 0 0 1em 0;
				padding: 0 2%;
			}
			.column-container {
				height: 100%;
				min-height: 100%;
				display: flex;
				flex-direction: column;
			}
			.column-child {
				flex: 1;
			}
			.flex-container {
				display: flex;
				height: 100%;
			}
			.flex-child {
				flex: 1;
			}
		</style>
	</head>
	<body>
		<div class="column-container">
			<div class="column-child">
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
			</div>
		</div>
	</body>
</html>`;
};
