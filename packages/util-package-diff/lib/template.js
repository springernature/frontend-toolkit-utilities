// HTML template wrapper
module.exports = (packageName, remote, local) => {
	return `<!doctype html>
<html lang="en">
	<head>
		<script>
    		(function(e){var t=e.documentElement,n=e.implementation;t.className='js';})(document)
		</script>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Visual Diff for ${packageName}</title>
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
			.row-container {
				display: flex;
				height: 100%;
			}
			.row-child {
				flex: 1;
			}
		</style>
	</head>
	<body>
		<div class="column-container">
			<div class="column-child">
				<div class="row-container">
					<div class="row-child">
						<h2>${packageName} v${remote.version}</h2>
						<iframe height="100%" width="100%" title="${packageName}@${remote.version}" scrolling="auto" allowtransparency="true" loading="lazy" srcdoc='${remote.html}' frameborder="0"></iframe>
					</div>
					<div class="row-child">
						<h2>${packageName} v${local.version}</h2>
						<iframe height="100%" width="100%" title="${packageName}@${local.version}" scrolling="auto" allowtransparency="true" loading="lazy" srcdoc='${local.html}' frameborder="0"></iframe>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>`;
};
