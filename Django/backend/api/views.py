import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['POST'])
def get_temporary_token(request):
    """Proxy endpoint to get a temporary token from AssemblyAI"""
    try:
        # Get the API key from the request
        assemblyai_key = request.data.get('api_key')

        if not assemblyai_key:
            return Response(
                {"error": "AssemblyAI API key is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Request body for AssemblyAI
        body = {
            "expires_in": request.data.get('expires_in', 3600)  # Default: 1 hour
        }

        # Make request to AssemblyAI
        response = requests.post(
            "https://api.assemblyai.com/v2/realtime/token",
            headers={
                "Authorization": assemblyai_key,
                "Content-Type": "application/json"
            },
            json=body
        )

        # Return response from AssemblyAI
        if response.status_code == 200:
            return Response(response.json())
        else:
            try:
                error_json = response.json()
                return Response(error_json, status=response.status_code)
            except Exception:
                return Response(
                    {"error": f"AssemblyAI API error: {response.text}"},
                    status=response.status_code
                )
    except Exception as e:
        return Response(
            {"error": f"Error processing request: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def anthropic_rewrite(request):
    """Proxy endpoint to rewrite text using Anthropic's Claude API"""
    try:
        # Log the request data for debugging
        print(f"Received anthropic/rewrite request: {request.data}")

        # Get the API key from the request
        anthropic_key = request.data.get('api_key')

        if not anthropic_key:
            return Response(
                {"error": "Anthropic API key is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get text and prompt from request
        text = request.data.get('text')
        prompt = request.data.get('prompt', 'Improve this text')

        if not text:
            return Response(
                {"error": "Text to rewrite is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        print(f"Processing rewrite request with prompt: {prompt}")

        # Meta prompt to enhance Claude's writing assistance capabilities
        meta_prompt = (
            "You are an expert writing analyzer and writing helper. Your goal is to help writers "
            "improve their text based on their specific requests. Analyze the text carefully and "
            "make thoughtful improvements while maintaining the original meaning and voice. Only "
            "respond with the improved version of the text, without any explanations or comments."
            "AND DO NOT BUT THE TEXT IN MARKDOWN OR Any other scripts or shells  just plain text "
            "with the proper spacing and lining."
        )

        # Full prompt to send to Claude
        full_prompt = f"{meta_prompt}\n\nOriginal text: \"{text}\"\n\nRequest: {prompt}\n\nImproved text:"

        # Make request to Anthropic Claude API (using Claude Haiku)
        headers = {
            "x-api-key": anthropic_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        payload = {
            "model": "claude-3-haiku-20240307",
            "max_tokens": 1024,
            "messages": [
                {"role": "user", "content": full_prompt}
            ]
        }

        print("Sending request to Anthropic API...")
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload
        )

        print(f"Anthropic API response status: {response.status_code}")

        # Return response from Anthropic
        if response.status_code == 200:
            data = response.json()
            improved_text = data["content"][0]["text"]
            return Response({"text": improved_text})
        else:
            try:
                error_json = response.json()
                print(f"Anthropic API error: {error_json}")
                error_message = str(error_json.get('error', {}).get('message', 'Unknown API error'))
                return Response(
                    {"error": error_message},
                    status=response.status_code
                )
            except Exception as e:
                error_text = response.text
                print(f"Non-JSON error from Anthropic: {error_text}")
                return Response(
                    {"error": f"Anthropic API error: {error_text}"},
                    status=response.status_code
                )
    except Exception as e:
        import traceback
        print(f"Exception in anthropic_rewrite: {str(e)}")
        print(traceback.format_exc())
        return Response(
            {"error": f"Error processing request: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )