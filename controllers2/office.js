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

const handleError = (error)=>{
    const response = {
        error: true,
        message: ""
    };

    switch(error){
        case "unauthorizedUser":
            response.message = "This office is private";
            break;
        default:
            console.error(error);
            response.message = "Server error";
    }

    return response;
}

module.exports = {
    userIsAuthorized,
    handleError
};
