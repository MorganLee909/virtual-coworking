const handleError = (error)=>{
    console.error(error);
    return {
        error: true,
        message: "Server error"
    };
}

module.exports = {
    handleError
};
