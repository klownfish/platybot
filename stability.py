import io
import os
import warnings
import time
from stability_sdk import client
import stability_sdk.interfaces.gooseai.generation.generation_pb2 as generation
import sys

stability_api = client.StabilityInference(
    key=os.environ['STABILITY_KEY'], 
    verbose=True,
)

prompt = " ".join(sys.argv[1:])
answers = stability_api.generate(
    prompt=prompt
)

# iterating over the generator produces the api response
for resp in answers:
    for artifact in resp.artifacts:
        if artifact.finish_reason == generation.FILTER:
            sys.exit(2)
        if artifact.type == generation.ARTIFACT_IMAGE:
            sys.stdout.buffer.write(artifact.binary)
            sys.exit(0)