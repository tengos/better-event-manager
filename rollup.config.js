import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import cjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default {
	input: 'ema.js',
	output: {
		file: 'index.js',
		format: 'umd',
		name: 'BetterEventManager'
	},
	plugins: [
		babel({
			exclude: 'node_modules/**',
			runtimeHelpers: true,
			presets: [
				[
					'@babel/env',
					{
						modules: false
					}
				]
			],
			plugins: ['@babel/plugin-proposal-class-properties']
		}),
		resolve(),
		cjs(),
		terser()
	]
}
