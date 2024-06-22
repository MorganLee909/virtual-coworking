/**
 * Determines whether the user is a member of the office
 *
 * @params {[Member]} members - Members of the office to check
 * @params {string} userId - String ID of the user to check
 * @return {boolean} - True is user is member, false otherwise
 */
const userIsAuthorized = (members, userId)=>{
    let isMember = false;
    for(let i = 0; i < members.length; i++){
        if(!members[i].userId) continue;
        if(members[i].userId.toString() === userId){
            if(members[i].status !== "active") return false;
            return true;
        }
    }

    return false;
}

/**
 * Determines if user is the owner of the office
 *
 * @params {Office} office - Office to check for ownership
 * @params {User} user - User to check for ownership
 * @return {boolean} - True if user is owner, false otherwise;
 */
const isOfficeOwner = (office, user)=>{
    return office.owner.toString() === user._id.toString();
}

/**
 * Creates a new table for an office
 *
 * @params {Office} office - Office in which to add a table
 * @return {Office} - Updated office
 */
const createNewTable = (office)=>{
    const newTable = {
        type: "general",
        occupants: []
    };

    for(let i = 0; i < 6; i++){
        newTable.occupants.push({seatNumber: 1});
    }

    office.tables.push(newTable);
    return office;
}

/**
 * Split members into verified/unverified. Allows fetching verified users
 *
 * @param {Office} office - Office containing the members
 * @return {{verified: [Member], unverified: [Member]}} - Members organized by verification
 */
const splitMembersByVerification = (office)=>{
    const members = {
        verified: [],
        unverified: []
    };

    for(let i = 0; i < office.users.length; i++){
        if(office.users[i].userId){
            members.verified.push(office.users[i].userId);
        }else{
            members.unverified.push(office.users[i]);
        }
    }

    return members;
}

const handleError = (error)=>{
    const response = {
        error: true,
        message: ""
    };

    switch(error){
        case "unauthorizedUser":
            response.message = "This office is private";
            break;
        case "notOwner":
            response.message = "You do not own this office";
            break;
        default:
            console.error(error);
            response.message = "Server error";
    }

    return response;
}

module.exports = {
    userIsAuthorized,
    isOfficeOwner,
    createNewTable,
    splitMembersByVerification,
    handleError
};
