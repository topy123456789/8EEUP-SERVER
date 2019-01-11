'use strict';

const LPP_TYPE_DIGITAL_INPUT = 0x00;
const LPP_TYPE_DIGITAL_OUTPUT = 0x01;
const LPP_TYPE_ANALOG_INPUT = 0x02;
const LPP_TYPE_ANALOG_OUTPUT = 0x03;
const LPP_TYPE_ILLUMINANCE_SENSOR = 0x65;
const LPP_TYPE_PRESENCE_SENSOR = 0x66;
const LPP_TYPE_TEMPERATURE_SENSOR = 0x67;
const LPP_TYPE_HUMIDITY_SENSOR = 0x68;
const LPP_TYPE_ACCELEROMETER = 0x71;
const LPP_TYPE_MAGNETOMETER = 0x72;
const LPP_TYPE_BAROMETER = 0x73;
const LPP_TYPE_GYROMETER = 0x86;
const LPP_TYPE_GPS_LOCATION = 0x88;

const lpp_decode = hexPayload => {
  let buffer = Buffer.from(hexPayload, 'hex');
  let index = 0;
  let result = {};
  while (index < buffer.length - 1) {
    let channel = buffer.readUInt8(index++);
    let property = '';
    let value = 0;
    switch (buffer.readUInt8(index++)) {
      case LPP_TYPE_DIGITAL_INPUT:
        property = 'digital_input';
        value = buffer.readUInt8(index++);
        break;
      case LPP_TYPE_DIGITAL_OUTPUT:
        property = 'digital_output';
        value = buffer.readUInt8(index++);
        break;
      case LPP_TYPE_ANALOG_INPUT:
        property = 'analog_input';
        value = buffer.readInt16BE(index) / 100.0;
        index += 2;
        break;
      case LPP_TYPE_ANALOG_OUTPUT:
        property = 'analog_input';
        value = buffer.readInt16BE(index) / 100.0;
        index += 2;
        break;
      case LPP_TYPE_ILLUMINANCE_SENSOR:
        property = 'illuminance_sensor';
        value = buffer.readUInt16LE(index);
        index += 2;
        break;
      case LPP_TYPE_PRESENCE_SENSOR:
        property = 'presence_sensor';
        value = buffer.readUInt8(index++);
        break;
      case LPP_TYPE_TEMPERATURE_SENSOR:
        property = 'temperature_sensor';
        value = buffer.readInt16BE(index) / 10.0;
        index += 2;
        break;
      case LPP_TYPE_HUMIDITY_SENSOR:
        property = 'humidity_sensor';
        value = buffer.readUInt8(index++) / 2.0;
        break;
      case LPP_TYPE_ACCELEROMETER:
        property = 'accelerometer';
        value = {};
        ['x', 'y', 'z'].forEach(axis => {
          value[axis] = buffer.readInt16BE(index) / 1000.0;
          index += 2;
        });
        break;
      case LPP_TYPE_MAGNETOMETER:
        property = 'magnetometer';
        value = {};
        ['x', 'y', 'z'].forEach(axis => {
          value[axis] = buffer.readInt16BE(index) / 1000.0;
          index += 2;
        });
        break;
      case LPP_TYPE_BAROMETER:
        property = 'barometer';
        value = buffer.readInt16BE(index) / 10.0;
        index += 2;
        break;
      case LPP_TYPE_GYROMETER:
        property = 'gyrometer';
        value = {};
        ['x', 'y', 'z'].forEach(axis => {
          value[axis] = buffer.readInt16BE(index) / 100.0;
          index += 2;
        });
        break;
      case LPP_TYPE_GPS_LOCATION:
        property = 'gps_location';
        value = {};
        /*
          These are 24-bit values, so we read them as 32-bit and shift down
          to carry the sign extension. With lat/lon we know there is enough
          data in the buffer to allow reading the extra byte.
        */
        ['latitude', 'longitude'].forEach(coord => {
          value[coord] = (buffer.readInt32BE(index) >> 8) / 10000.0;
          index += 3;
        });
        /*
          Altitude is the last item in the structure so there is no garuntee
          the frame buffer is big enough to read an extra byte. Therefore we
          copy its 3 bytes to a new 4 byte buffer to allow reading as a 32-bit
          value.
        */
        let tbuff = Buffer.alloc(4, 0);
        buffer.copy(tbuff, 0, index, index + 3);
        value['altitude'] = (tbuff.readInt32BE(0) >> 8) / 100.0;
        index += 3;
        break;
    }
    if (result[property] === undefined) {
      result[property] = {};
    }
    result[property][channel] = value;
  }
  return result;
};

module.exports.decode = lpp_decode;
