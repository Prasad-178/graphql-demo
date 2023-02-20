const context = ({ req }) => {
    const token = req.headers.authorization || ''

    try {
        return { _id, email } = jwt.ver
    } catch (err) {
        console.log(err)
    }
}