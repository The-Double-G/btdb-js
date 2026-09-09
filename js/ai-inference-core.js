(function(root) {
    function safeNumber(value) {
        return Number.isFinite(Number(value)) ? Number(value) : 0
    }

    function encode(inputs, firstWeights, firstBias, secondWeights, secondBias) {
        var hidden = []
        var embedding = []
        var preactivation = []
        for(var row = 0; row < firstWeights.length; row++) {
            var hiddenSum = safeNumber(firstBias[row])
            for(var col = 0; col < inputs.length; col++) {
                hiddenSum += safeNumber(firstWeights[row][col]) * safeNumber(inputs[col])
            }
            hidden.push(Math.tanh(hiddenSum))
        }
        for(var embeddingIndex = 0; embeddingIndex < secondWeights.length; embeddingIndex++) {
            var embeddingSum = safeNumber(secondBias[embeddingIndex])
            for(var hiddenIndex = 0; hiddenIndex < hidden.length; hiddenIndex++) {
                embeddingSum += safeNumber(secondWeights[embeddingIndex][hiddenIndex]) * hidden[hiddenIndex]
            }
            preactivation.push(embeddingSum)
            embedding.push(Math.tanh(embeddingSum))
        }
        return { hidden: hidden, embedding: embedding, preactivation: preactivation }
    }

    function createStateEmbedding(decision, stateFeatures, memoryIn) {
        var state = encode(stateFeatures, decision.WState1, decision.bState1, decision.WState2, decision.bState2)
        var memoryOut = []
        for(var memoryIndex = 0; memoryIndex < 16; memoryIndex++) {
            var memorySum = safeNumber(decision.bMemory[memoryIndex])
            for(var stateInputIndex = 0; stateInputIndex < 48; stateInputIndex++) memorySum += safeNumber(decision.WStateToMemory[memoryIndex][stateInputIndex]) * state.embedding[stateInputIndex]
            for(var memoryInputIndex = 0; memoryInputIndex < 16; memoryInputIndex++) memorySum += safeNumber(decision.WMemoryToMemory[memoryIndex][memoryInputIndex]) * safeNumber(memoryIn[memoryInputIndex])
            memoryOut.push(Math.tanh(memorySum))
        }

        var stateEmbedding = []
        for(var embeddingIndex = 0; embeddingIndex < 48; embeddingIndex++) {
            var stateSum = state.preactivation[embeddingIndex]
            for(var memoryColumn = 0; memoryColumn < 16; memoryColumn++) stateSum += safeNumber(decision.WMemoryToState[embeddingIndex][memoryColumn]) * memoryOut[memoryColumn]
            stateEmbedding.push(Math.tanh(stateSum))
        }

        return { stateEmbedding: stateEmbedding, memoryOut: memoryOut }
    }

    function scoreCandidate(decision, stateEmbedding, candidateFeatures, familyIndex) {
        var candidate = encode(candidateFeatures, decision.WCandidate1, decision.bCandidate1, decision.WCandidate2, decision.bCandidate2)
        var dot = 0
        var stateSquared = 0
        var candidateSquared = 0
        for(var i = 0; i < 48; i++) {
            dot += stateEmbedding[i] * candidate.embedding[i]
            stateSquared += stateEmbedding[i] * stateEmbedding[i]
            candidateSquared += candidate.embedding[i] * candidate.embedding[i]
        }
        var stateNorm = Math.sqrt(stateSquared + 1e-6)
        var candidateNorm = Math.sqrt(candidateSquared + 1e-6)
        var normalizedDot = dot / (stateNorm * candidateNorm)
        return Math.tanh(normalizedDot + safeNumber(decision.familyBias[familyIndex]))
    }

    function scoreDecision(policy, stateFeatures, candidateFeatures, familyIndex, memoryIn) {
        var decision = policy && policy.decision ? policy.decision : policy
        if(!decision || !Array.isArray(stateFeatures) || !Array.isArray(candidateFeatures) || !Array.isArray(memoryIn)) {
            throw new Error("Invalid AI inference input")
        }
        if(stateFeatures.length != 128 || candidateFeatures.length != 128 || memoryIn.length != 16) {
            throw new Error("AI inference dimensions are invalid")
        }
        var state = createStateEmbedding(decision, stateFeatures, memoryIn)
        return scoreCandidate(decision, state.stateEmbedding, candidateFeatures, familyIndex)
    }

    root.aiInferenceScoreDecisionBatch = function(policy, stateFeatures, memoryIn, familyIndex, candidates) {
        if(!Array.isArray(candidates)) {
            throw new Error("AI inference candidates are invalid")
        }
        var decision = policy && policy.decision ? policy.decision : policy
        if(!decision || !Array.isArray(stateFeatures) || !Array.isArray(memoryIn) || stateFeatures.length != 128 || memoryIn.length != 16) {
            throw new Error("AI inference dimensions are invalid")
        }
        var state = createStateEmbedding(decision, stateFeatures, memoryIn)
        var scores = []
        for(var i = 0; i < candidates.length; i++) {
            if(!Array.isArray(candidates[i]) || candidates[i].length != 128) throw new Error("AI inference candidate dimensions are invalid")
            scores.push(scoreCandidate(decision, state.stateEmbedding, candidates[i], familyIndex))
        }
        return scores
    }
})(typeof self != "undefined" ? self : window)
