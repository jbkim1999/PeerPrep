import { createMatch, getAvailableMatch } from './repository.js';

// need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateMatch(hostPlayer, difficulty) {
    try {
        const newMatch = await createMatch({ hostPlayer, difficulty });
        newMatch.save();
        return true;
    } catch (err) {
        console.log('ERROR: Could not create new match');
        return { err };
    }
}

export async function ormGetAvailableMatch(difficulty) {
    try {
        const availableMatch = await getAvailableMatch(difficulty);
        return availableMatch;
    } catch (err) {
        console.log('ERROR: Could not load available match');
        return { err };
    }
}