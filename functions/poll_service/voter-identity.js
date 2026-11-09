/* eslint-disable camelcase */
const crypto = require('crypto');

const VOTER_COOKIE = 'voter_token';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

const cookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: 'lax',
	path: '/',
	maxAge: COOKIE_MAX_AGE
};

function readVoterToken(req) {
	const header = req.headers.cookie;
	if (!header) {
		return null;
	}
	const entry = header
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${VOTER_COOKIE}=`));
	if (!entry) {
		return null;
	}
	const token = decodeURIComponent(entry.slice(VOTER_COOKIE.length + 1));
	return token || null;
}

function newVoterToken() {
	return crypto.randomBytes(16).toString('hex');
}

module.exports = {
	VOTER_COOKIE,
	cookieOptions,
	readVoterToken,
	newVoterToken
};
