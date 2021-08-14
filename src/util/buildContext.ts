const buildCommonContext = (req, additionalContext = {}) => ({
    authenticate: () => {
        const token = req.headers.token;
    },
    req,
    ...additionalContext,
});

const buildContext = (contextParams) => {
    const {req, connection, payload, ...additionalContext} = contextParams;

    if (connection) {
        return buildCommonContext(connection.context.req, additionalContext);
    }

    const sharedContext = buildCommonContext(req as any, additionalContext);

    return {
        ...sharedContext,
    };
};

export default buildContext;
