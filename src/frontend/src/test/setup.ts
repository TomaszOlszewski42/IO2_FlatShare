const configureEnzyme = async () => {
	try {
		const { configure } = await import('enzyme')
		const { default: Adapter } = await import('enzyme-adapter-preact-pure')
		configure({ adapter: new Adapter() })
	} catch {
		// Enzyme is optional for suites that don't use it directly.
	}
}

await configureEnzyme()
