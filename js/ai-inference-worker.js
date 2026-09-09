importScripts("ai-inference-core.js")

var aiInferencePolicy = null
var aiInferencePolicyEpoch = 0

self.onmessage = function(event) {
    var message = event.data || {}
    if(message.type != "score") {
        return
    }

    try {
        if(message.policy) {
            aiInferencePolicy = message.policy
            aiInferencePolicyEpoch = message.policyEpoch
        }
        if(!aiInferencePolicy || message.policyEpoch != aiInferencePolicyEpoch) {
            throw new Error("AI inference policy is unavailable")
        }
        var scores = aiInferenceScoreDecisionBatch(aiInferencePolicy, message.stateFeatures, message.memoryIn, message.familyIndex, message.candidates)
        self.postMessage({
            type: "scores",
            requestId: message.requestId,
            policyEpoch: aiInferencePolicyEpoch,
            scores: scores,
        })
    } catch(error) {
        self.postMessage({
            type: "error",
            requestId: message.requestId,
            policyEpoch: aiInferencePolicyEpoch,
            message: error && error.message ? error.message : "AI inference failed",
        })
    }
}
