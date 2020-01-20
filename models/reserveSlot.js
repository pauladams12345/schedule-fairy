// Database functions most closely related to the Reserve_Slot table

var	dbcon = 	require('../config/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create row in Reserve_Slot with the given information
module.exports.createReservation = async function(user_id, slotId) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"INSERT INTO `Reserve_Slot` " +
		"(`fk_user_id`,`fk_slot_id`) VALUES (?,?)",
		  [user_id, slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete reservation for the corresponding user id and slot Id
module.exports.deleteReservation = async function(user_id, slotId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"DELETE FROM `Reserve_Slot` " +
		"WHERE `fk_user_id` = ? and `fk_slot_id` = ?;",
		 [user_id, slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete a all reservations for the given slot
module.exports.deleteAllReservations = async function(slotId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"DELETE FROM `Reserve_Slot` " +
		"WHERE `fk_slot_id` = ?;",
		 [slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Get info for all attendees of an event
module.exports.getEventAttendees = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT DISTINCT u.name, u.email, u.user_id " +
		"FROM `Reserve_Slot` rs " +
		"INNER JOIN `Slot` s ON rs.fk_slot_id = s.slot_id " +
		"INNER JOIN `user` u ON rs.fk_user_id = u.user_id " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"WHERE e.event_id = ?", [eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);
	}	
};

// Return the number of total reservations a user has made for a given event.
module.exports.getNumUserReservations = async function(user_id, eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT COUNT (*) AS num " +
		"FROM `Slot` s " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"INNER JOIN `Reserve_Slot` rs ON rs.fk_slot_id = s.slot_id " +
		"WHERE rs.fk_user_id = ? AND s.fk_event_id = ?", [user_id, eventId]);
		connection.end();
		return rows[0].num;
	}
	catch (err) {
		console.log(err);
	}
};

// Return the slot Ids for each reservation a given user has made for a given event.
module.exports.getSlotIdsByUserAndEvent = async function(user_id, eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT rs.fk_slot_id " +
		"FROM `Reserve_Slot` rs " +
		"INNER JOIN `Slot` s ON s.slot_id = rs.fk_slot_id " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"WHERE rs.fk_user_id = ? AND s.fk_event_id = ?", [user_id, eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);
	}
};
