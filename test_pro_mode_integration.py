"""
Integration tests for Pro Mode workflow.

Tests the /api/generate/pro endpoint with various scenarios including:
- Valid payload with all fields
- Validation error responses
- Bria API integration
- Error handling for API failures

Requirements tested:
- 9.1: POST endpoint at /api/generate/pro
- 9.2: Accept JSON payloads with structured_prompt and seed
- 9.3: Validation of structured prompt fields
- 9.4: Error handling for invalid payloads
- 9.5: CORS headers in responses
- 9.6: Bria API integration without Gemini
"""

from api_server import app, validate_pro_mode_request
import json
import sys
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path

# Add parent directory to path to import api_server
sys.path.insert(0, str(Path(__file__).parent))


class TestProModeIntegration(unittest.TestCase):
    """Integration tests for Pro Mode endpoint."""

    def setUp(self):
        """Set up test client before each test."""
        self.app = app
        self.client = self.app.test_client()
        self.app.testing = True

    def get_valid_pro_mode_payload(self):
        """Return a valid Pro Mode payload for testing.

        Requirement 9.2: Valid payload structure with structured_prompt and seed
        """
        return {
            "structured_prompt": {
                "short_description": "A premium smartphone with sleek design",
                "background_setting": "Clean white studio background",
                "style_medium": "Professional product photography",
                "artistic_style": "Modern minimalist",
                "context": "E-commerce product showcase",
                "lighting": {
                    "conditions": "Soft studio lighting",
                    "direction": "Front and top",
                    "shadows": "Minimal soft shadows"
                },
                "aesthetics": {
                    "composition": "Centered with rule of thirds",
                    "color_scheme": "Cool tones with white balance",
                    "mood_atmosphere": "Professional and clean"
                },
                "photographic_characteristics": {
                    "camera_angle": "Eye level, slightly elevated",
                    "lens_focal_length": "85mm",
                    "depth_of_field": "Shallow, f/2.8",
                    "focus": "Sharp focus on product"
                },
                "objects": []
            },
            "seed": 123456
        }

    def get_valid_payload_with_objects(self):
        """Return a valid Pro Mode payload with objects array.

        Requirement 9.2: Valid payload with objects array
        """
        payload = self.get_valid_pro_mode_payload()
        payload["structured_prompt"]["objects"] = [
            {
                "description": "Smartphone device",
                "location": "Center of frame",
                "relationship": "Main subject",
                "relative_size": "Large, fills 60% of frame",
                "shape_and_color": "Rectangular, black",
                "texture": "Glossy glass and metal",
                "appearance_details": "Premium finish with reflections"
            },
            {
                "description": "Charging cable",
                "location": "Bottom right",
                "relationship": "Accessory",
                "relative_size": "Small",
                "shape_and_color": "Coiled, white",
                "texture": "Smooth plastic",
                "appearance_details": "Clean white cable"
            }
        ]
        return payload

    @patch('api_server.call_bria_with_structured_prompt')
    def test_valid_pro_mode_request(self, mock_bria):
        """Test /api/generate/pro endpoint with valid payload.

        Requirement 9.1, 9.2: Test endpoint accepts valid structured prompt
        """
        # Mock successful Bria response
        mock_bria.return_value = {
            'image_url': 'https://example.com/pro-mode-image.jpg'
        }

        payload = self.get_valid_pro_mode_payload()
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # Verify response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['final_image_url'],
                         'https://example.com/pro-mode-image.jpg')

        # Verify Bria was called with correct parameters
        mock_bria.assert_called_once()
        call_args = mock_bria.call_args[0]

        # First argument should be JSON string of structured prompt
        prompt_json_string = call_args[0]
        self.assertIsInstance(prompt_json_string, str)

        # Verify it's valid JSON
        parsed_prompt = json.loads(prompt_json_string)
        self.assertEqual(parsed_prompt['short_description'],
                         'A premium smartphone with sleek design')

        # Second argument should be seed
        seed = call_args[1]
        self.assertEqual(seed, 123456)

    @patch('api_server.call_bria_with_structured_prompt')
    def test_valid_request_with_objects(self, mock_bria):
        """Test Pro Mode with objects array.

        Requirement 9.2: Test payload with objects array
        """
        mock_bria.return_value = {
            'image_url': 'https://example.com/image-with-objects.jpg'
        }

        payload = self.get_valid_payload_with_objects()
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])

        # Verify objects were included in Bria call
        mock_bria.assert_called_once()
        prompt_json_string = mock_bria.call_args[0][0]
        parsed_prompt = json.loads(prompt_json_string)

        self.assertEqual(len(parsed_prompt['objects']), 2)
        self.assertEqual(parsed_prompt['objects'][0]
                         ['description'], 'Smartphone device')
        self.assertEqual(parsed_prompt['objects'][1]
                         ['description'], 'Charging cable')

    def test_missing_structured_prompt(self):
        """Test validation error for missing structured_prompt.

        Requirement 9.3, 9.4: Test validation of required fields
        """
        payload = {"seed": 123456}
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('structured_prompt', data['error'])

    def test_missing_seed(self):
        """Test validation error for missing seed.

        Requirement 9.3, 9.4: Test validation of required fields
        """
        payload = self.get_valid_pro_mode_payload()
        del payload['seed']

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('seed', data['error'])

    def test_invalid_seed_type(self):
        """Test validation error for invalid seed type.

        Requirement 9.3, 9.4: Test validation of field types
        """
        payload = self.get_valid_pro_mode_payload()
        payload['seed'] = "not_an_integer"

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('seed', data['error'])

    def test_missing_top_level_field(self):
        """Test validation error for missing top-level field.

        Requirement 9.3, 9.4: Test validation of structured prompt fields
        """
        payload = self.get_valid_pro_mode_payload()
        del payload['structured_prompt']['short_description']

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('short_description', data['error'])

    def test_empty_top_level_field(self):
        """Test validation error for empty top-level field.

        Requirement 9.3, 9.4: Test validation of non-empty strings
        """
        payload = self.get_valid_pro_mode_payload()
        payload['structured_prompt']['background_setting'] = ""

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('background_setting', data['error'])

    def test_missing_lighting_field(self):
        """Test validation error for missing lighting field.

        Requirement 9.3, 9.4: Test validation of nested objects
        """
        payload = self.get_valid_pro_mode_payload()
        del payload['structured_prompt']['lighting']['conditions']

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('lighting.conditions', data['error'])

    def test_missing_aesthetics_field(self):
        """Test validation error for missing aesthetics field.

        Requirement 9.3, 9.4: Test validation of nested objects
        """
        payload = self.get_valid_pro_mode_payload()
        del payload['structured_prompt']['aesthetics']['composition']

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('aesthetics.composition', data['error'])

    def test_missing_camera_field(self):
        """Test validation error for missing camera field.

        Requirement 9.3, 9.4: Test validation of nested objects
        """
        payload = self.get_valid_pro_mode_payload()
        del payload['structured_prompt']['photographic_characteristics']['camera_angle']

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn(
            'photographic_characteristics.camera_angle', data['error'])

    def test_invalid_objects_type(self):
        """Test validation error for invalid objects type.

        Requirement 9.3, 9.4: Test validation of objects array
        """
        payload = self.get_valid_pro_mode_payload()
        payload['structured_prompt']['objects'] = "not_an_array"

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('objects', data['error'])

    def test_invalid_object_in_array(self):
        """Test validation error for invalid object in objects array.

        Requirement 9.3, 9.4: Test validation of object fields
        """
        payload = self.get_valid_pro_mode_payload()
        payload['structured_prompt']['objects'] = [
            {
                "description": "Valid object",
                "location": "Center",
                "relationship": "Main",
                "relative_size": "Large",
                "shape_and_color": "Black",
                "texture": "Smooth",
                # Missing appearance_details
            }
        ]

        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('appearance_details', data['error'])

    def test_empty_json_body(self):
        """Test error handling for empty JSON body.

        Requirement 9.4: Test error handling for invalid requests
        """
        response = self.client.post(
            '/api/generate/pro',
            data='',
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('JSON', data['error'])

    def test_invalid_json_body(self):
        """Test error handling for invalid JSON.

        Requirement 9.4: Test error handling for malformed JSON
        """
        response = self.client.post(
            '/api/generate/pro',
            data='{"invalid": json}',
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('JSON', data['error'])

    @patch('api_server.call_bria_with_structured_prompt')
    def test_bria_api_failure(self, mock_bria):
        """Test error handling for Bria API failures.

        Requirement 9.6: Test error handling for API failures
        """
        # Mock Bria API failure
        mock_bria.side_effect = Exception("Bria API connection failed")

        payload = self.get_valid_pro_mode_payload()
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    @patch('api_server.call_bria_with_structured_prompt')
    def test_bria_returns_no_image_url(self, mock_bria):
        """Test error handling when Bria returns no image URL.

        Requirement 9.6: Test error handling for incomplete responses
        """
        # Mock Bria returning result without image_url
        mock_bria.return_value = {}

        payload = self.get_valid_pro_mode_payload()
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_cors_headers_present(self):
        """Test CORS headers are present in response.

        Requirement 9.5: Test CORS configuration
        """
        payload = self.get_valid_pro_mode_payload()
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json',
            headers={'Origin': 'http://localhost:3000'}
        )

        # CORS headers should be present
        self.assertIn('Access-Control-Allow-Origin', response.headers)

    def test_preflight_options_request(self):
        """Test preflight OPTIONS request for CORS.

        Requirement 9.5: Test CORS preflight handling
        """
        response = self.client.options(
            '/api/generate/pro',
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        )

        # Preflight should return 200 with CORS headers
        self.assertEqual(response.status_code, 200)
        self.assertIn('Access-Control-Allow-Origin', response.headers)
        self.assertIn('Access-Control-Allow-Methods', response.headers)

    @patch('api_server.call_bria_with_structured_prompt')
    def test_json_string_conversion(self, mock_bria):
        """Test that structured_prompt is converted to JSON string.

        Requirement 9.6: Test JSON string conversion for Bria API
        """
        mock_bria.return_value = {
            'image_url': 'https://example.com/image.jpg'
        }

        payload = self.get_valid_pro_mode_payload()
        response = self.client.post(
            '/api/generate/pro',
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)

        # Verify Bria was called with JSON string
        mock_bria.assert_called_once()
        prompt_json_string = mock_bria.call_args[0][0]

        # Should be a string
        self.assertIsInstance(prompt_json_string, str)

        # Should be valid JSON
        parsed = json.loads(prompt_json_string)
        self.assertIsInstance(parsed, dict)

        # Should contain all structured prompt fields
        self.assertIn('short_description', parsed)
        self.assertIn('lighting', parsed)
        self.assertIn('aesthetics', parsed)
        self.assertIn('photographic_characteristics', parsed)
        self.assertIn('objects', parsed)


class TestProModeValidation(unittest.TestCase):
    """Unit tests for Pro Mode validation function."""

    def test_validate_valid_payload(self):
        """Test validation passes for valid payload.

        Requirement 9.3: Test validation function
        """
        payload = {
            "structured_prompt": {
                "short_description": "Test",
                "background_setting": "White",
                "style_medium": "Photo",
                "artistic_style": "Modern",
                "context": "Product",
                "lighting": {
                    "conditions": "Soft",
                    "direction": "Top",
                    "shadows": "Minimal"
                },
                "aesthetics": {
                    "composition": "Center",
                    "color_scheme": "Neutral",
                    "mood_atmosphere": "Clean"
                },
                "photographic_characteristics": {
                    "camera_angle": "Eye level",
                    "lens_focal_length": "50mm",
                    "depth_of_field": "f/4",
                    "focus": "Sharp"
                },
                "objects": []
            },
            "seed": 123456
        }

        is_valid, error = validate_pro_mode_request(payload)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_validate_missing_field(self):
        """Test validation fails for missing field.

        Requirement 9.3: Test validation detects missing fields
        """
        payload = {
            "structured_prompt": {
                # Missing short_description
                "background_setting": "White",
                "style_medium": "Photo",
                "artistic_style": "Modern",
                "context": "Product",
                "lighting": {
                    "conditions": "Soft",
                    "direction": "Top",
                    "shadows": "Minimal"
                },
                "aesthetics": {
                    "composition": "Center",
                    "color_scheme": "Neutral",
                    "mood_atmosphere": "Clean"
                },
                "photographic_characteristics": {
                    "camera_angle": "Eye level",
                    "lens_focal_length": "50mm",
                    "depth_of_field": "f/4",
                    "focus": "Sharp"
                },
                "objects": []
            },
            "seed": 123456
        }

        is_valid, error = validate_pro_mode_request(payload)
        self.assertFalse(is_valid)
        self.assertIsNotNone(error)
        self.assertIn('short_description', error)


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
