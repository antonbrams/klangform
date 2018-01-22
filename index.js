
let MIDI   = require('midi')
let Serial = require('serialport')
let Colors = require('colors')
console.log('Hi, Jacob!')

// open midi connection
let midi = new MIDI.output()
midi.openVirtualPort('Klangform')
console.log('[Klangform]'.gray, 'channel is created...'.green)

// list of devices
let devices = [
	{port: 'HC-05-DevB', name: 'Dehn'},
	{port: 'HC-06-DevB', name: 'Stab'},
	{port: 'HC-07-DevB', name: 'Flex'}]

// connect all devices
devices.forEach(device => {
	// open serial connection
	device.connection = new Serial(`/dev/tty.${device.port}`, {
		baudRate : 9600, 
		lock	 : false})
	// get additional information
	device.connection.on('error', err => 
		console.log(`[${device.name}]`.gray, `error: ${err.message.red}`.red))
	device.connection.on('open', () => 
		console.log(`[${device.name}]`.gray, `is connected...`.green))
	// create parser
	let parser = new Serial.parsers.ByteLength({length: 3})
	device.connection.pipe(parser)
	// receive stuff
	parser.on('data', data => {
		let msg = [data[0], data[1], data[2]]
		console.log(`[${device.name}]`.gray, `${msg}`)
		midi.sendMessage(msg)
	})
})

// disconnect all the devices on exit
process.on('SIGINT', () => {
	// midi
	midi.closePort()
	console.log('\nMidi is disconnected!')
	// serial
	devices.forEach(device => {
		device.connection.close()
		console.log(`[${device.name}]`.gray, `is disconnected!`.green)
	})
	console.log('Buy Buy, Jacob!')
})
