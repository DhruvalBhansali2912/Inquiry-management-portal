<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inquiry Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 20px;">Thank You For Contacting Us</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.85;">Reference Code: {{ $inquiry->reference_no }}</p>
        </div>
        <div style="padding: 24px;">
            <p style="margin-top: 0;">Dear {{ $inquiry->name }},</p>
            <p>We have successfully received your inquiry regarding <strong>"{{ $inquiry->subject }}"</strong>. A member of our team has been notified and will review your request shortly.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #475569;">
                    <strong>Inquiry Reference:</strong> {{ $inquiry->reference_no }}<br>
                    <strong>Submitted on:</strong> {{ $inquiry->created_at->format('M d, Y h:i A') }}
                </p>
            </div>

            <p style="font-size: 14px; color: #475569;">If you have any supplementary details to share, please reply directly with your reference number.</p>
            
            <p style="margin-bottom: 0; font-size: 14px;">Best regards,<br><strong>Customer Success Team</strong></p>
        </div>
    </div>
</body>
</html>
