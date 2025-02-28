# backend/api/views.py
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
            # Pass through the error from AssemblyAI
            try:
                error_json = response.json()
                return Response(
                    error_json,
                    status=response.status_code
                )
            except:
                # If not JSON, return text
                return Response(
                    {"error": f"AssemblyAI API error: {response.text}"},
                    status=response.status_code
                )
    
    except Exception as e:
        return Response(
            {"error": f"Error processing request: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )