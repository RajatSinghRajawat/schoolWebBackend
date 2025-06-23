    const OrganisationRegister = require('../models/OrganisationRegister');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    // Generate Static OTP for development
    const generateOTP = () => {
        return "1234"; // Static OTP for development
    };

    // Send Mobile OTP
    exports.sendMobileOTP = async (req, res) => {
        try {
            const { mobileNumber } = req.body;

            if (!mobileNumber) {
                return res.status(400).json({ message: 'Mobile number is required' });
            }

            // Generate static OTP
            const otp = generateOTP();

            // Find if organization exists with this mobile number
            let organisation = await OrganisationRegister.findOne({ mobileNumber });

            if (organisation) {
                // Update existing organization's mobile OTP
                organisation.otp = otp;
                organisation.mobileOtpVerificationStatus = false;
            } else {
                // Create new organization entry with mobile OTP
                organisation = new OrganisationRegister({
                    mobileNumber,
                    otp: otp,
                    mobileOtpVerificationStatus: false
                });
            }

            await organisation.save();

            // For development, sending static OTP in response
            res.status(200).json({
                message: 'Mobile OTP sent successfully',
                status: true,
                otp: "1234" // Static OTP for development
            });

        } catch (error) {
            console.error('Error in sendMobileOTP:', error);
            res.status(500).json({ message: 'Error sending mobile OTP' });
        }
    };

    // Send Email OTP
    exports.sendEmailOTP = async (req, res) => {
        try {
            const { email,mobileNumber } = req.body.data;
            console.log(email,mobileNumber,"email,mobileNumber");
            // return ;

            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            // Generate static OTP
            const otp = generateOTP();

            // Find if organization exists with this email in either email or organiserEmail field
            let organisation = await OrganisationRegister.findOne({ 
                $or: [
                    { email: email },
                    { organiserEmail: email },
                    { mobileNumber: mobileNumber }
                ]
            });

            if (organisation) {
                // Update existing organization's email OTP
                organisation.otp = otp;
                organisation.email = email;
                organisation.emailOtpVerificationStatus = false;
            } else {
                // Create new organization entry with email OTP
                organisation = new OrganisationRegister({
                    email: email,
                    otp: otp,
                    emailOtpVerificationStatus: false
                });
            }

            await organisation.save();

            // For development, sending static OTP in response
            res.status(200).json({
                message: 'Email OTP sent successfully',
                status: true,
                otp: "1234" // Static OTP for development
            });

        } catch (error) {
            console.error('Error in sendEmailOTP:', error);
            res.status(500).json({ message: 'Error sending email OTP' });
        }
    };

    // Verify Mobile OTP
    exports.verifyMobileOTP = async (req, res) => {
        try {
            const { mobileNumber, otp } = req.body;
            console.log(mobileNumber, otp,"kkkk");

            if (!mobileNumber || !otp) {
                return res.status(400).json({ message: 'Mobile number and OTP are required' });
            }

            const organisation = await OrganisationRegister.findOne({ mobileNumber });

            if (!organisation) {
                return res.status(404).json({ message: 'Organization not found' });
            }
            console.log(organisation, otp,"kkkk");

            if (organisation.otp !== otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
            organisation.mobileOtpVerificationStatus = true;
            organisation.otp = undefined; // Clear OTP after successful verification
            await organisation.save();

            res.status(200).json({ message: 'Mobile OTP verified successfully', status: true });

        } catch (error) {
            console.error('Error in verifyMobileOTP:', error);
            res.status(500).json({ message: 'Error verifying mobile OTP' });
        }
    };

    // Verify Email OTP
    exports.verifyEmailOTP = async (req, res) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({ message: 'Email and OTP are required' });
            }

            const organisation = await OrganisationRegister.findOne({ 
                $or: [
                    { email: email },
                    { organiserEmail: email }
                ]
            });

            if (!organisation) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            if (organisation.otp !== otp) {
                return res.status(400).json({ message: 'Invalid OTP' });
            }

            organisation.emailOtpVerificationStatus = true;
            organisation.otp = undefined; // Clear OTP after successful verification
            await organisation.save();

            res.status(200).json({ message: 'Email OTP verified successfully', status: true });

        } catch (error) {
            console.error('Error in verifyEmailOTP:', error);
            res.status(500).json({ message: 'Error verifying email OTP' });
        }
    };

    // Register Organization
    exports.registerOrganisation = async (req, res) => {
        try {
            const {
                name,
                role,
                mobileNumber,
                organiserName,
                organiserAddress,
                organiserMobileNumber,
                organiserEmail,
                organiserWebsite,
                directorName,
                directorMobileNumber,
                password
            } = req.body;

            // Check if organization exists
            const existingOrg = await OrganisationRegister.findOne({ mobileNumber });
            console.log(existingOrg,"existingOrg");

            if (existingOrg && !existingOrg.emailOtpVerificationStatus && !existingOrg.mobileOtpVerificationStatus) {
                return res.status(400).json({ message: 'Please verify OTP first' });
            }

            if (existingOrg && existingOrg.name) {
                return res.status(400).json({ message: 'Organization already registered' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // If organization exists after OTP verification, update it
            if (existingOrg) {
                Object.assign(existingOrg, {
                    name,
                    role,
                    organiserName,
                    organiserAddress,
                    organiserMobileNumber,
                    organiserEmail,
                    organiserWebsite,
                    directorName,
                    directorMobileNumber,
                    password: hashedPassword
                });

                await existingOrg.save();
                console.log("data 1")
                console.log({ message: 'Organization registered successfully', data: {...existingOrg, status: true}, status: true })

                return res.status(200).json({ message: 'Organization registered successfully', data: {...existingOrg,status:true}, status: true });
            }

            // Create new organization
            const newOrganisation = new OrganisationRegister({
                name,
                role,
                mobileNumber,
                organiserName,
                organiserAddress,
                organiserMobileNumber,
                organiserEmail,
                organiserWebsite,
                directorName,
                directorMobileNumber,
                password: hashedPassword,
                otpVerificationStatus: true
            });
            console.log("data 2")
    console.log({ message: 'Organization registered successfully', data: {...newOrganisation, status: true}, status: true })
            await newOrganisation.save();
            res.status(201).json({ message: 'Organization registered successfully', data: {...newOrganisation, status: true}, status: true });

        } catch (error) {
            console.error('Error in registerOrganisation:', error);
            res.status(500).json({ message: 'Error registering organization' });
        }
    };

    // Get all organizations
    exports.getAllOrganisations = async (req, res) => {
        try {
            const organisations = await OrganisationRegister.find({}).select('-password -otp');
            res.status(200).json({ data: organisations, status: true });
        } catch (error) {
            console.error('Error in getAllOrganisations:', error);
            res.status(500).json({ message: 'Error fetching organizations', status: false });
        }
    };

    // Get organization by ID
    exports.getOrganisationById = async (req, res) => {
        try {
            const organisation = await OrganisationRegister.findById(req.params.id).select('-password -otp');
            if (!organisation) {
                return res.status(404).json({ message: 'Organization not found' });
            }
            res.status(200).json({ data: organisation, status: true });
        } catch (error) {
            console.error('Error in getOrganisationById:', error);
            res.status(500).json({ message: 'Error fetching organization', status: false });
        }
    };

    // Login Organization
    exports.loginOrganisation = async (req, res) => {
        try {
            const { mobileNumber, email, password } = req.body;
            console.log(mobileNumber, email, password,"loginOrganisation");

            if ((!mobileNumber && !email) || !password) {
                return res.status(400).json({ 
                    message: 'Either mobile number or email, and password are required',
                    status: false 
                });
            }

            // Find organization by mobile number or email
            let organisation;
            if (mobileNumber) {
                organisation = await OrganisationRegister.findOne({ mobileNumber });
            } else {
                organisation = await OrganisationRegister.findOne({ 
                    $or: [
                        { email: email },
                        { organiserEmail: email }
                    ]
                });
            }

            console.log(organisation,"kkkkkk");

            if (!organisation) {
                return res.status(404).json({ 
                    message: 'Organization not found',
                    status: false 
                });
            }

            // Check if organization has a password (fully registered)
            if (!organisation.password) {
                return res.status(400).json({ 
                    message: 'Organization registration is incomplete. Please complete registration first.',
                    status: false 
                });
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(password, organisation.password);

            if (!isPasswordValid) {
                return res.status(401).json({ 
                    message: 'Invalid password',
                    status: false 
                });
            }

            // Return organization data without password
            const organisationData = organisation.toObject();
            delete organisationData.password;
            delete organisationData.otp;

            res.status(200).json({
                message: 'Login successful',
                data: organisationData,
                status: true
            });

        } catch (error) {
            console.error('Error in loginOrganisation:', error);
            res.status(500).json({ 
                message: 'Error during login',
                status: false 
            });
        }
    };

    // Send Forget Password OTP
    exports.sendForgetPasswordOTP = async (req, res) => {
        try {
            const { mobileNumber, email } = req.body;

            if (!mobileNumber && !email) {
                return res.status(400).json({ 
                    message: 'Either mobile number or email is required',
                    status: false 
                });
            }

            // Find organization by mobile number or email
            let organisation;
            if (mobileNumber) {
                organisation = await OrganisationRegister.findOne({ mobileNumber });
            } else {
                organisation = await OrganisationRegister.findOne({ 
                    $or: [
                        { email: email },
                        { organiserEmail: email }
                    ]
                });
            }

            if (!organisation) {
                return res.status(404).json({ 
                    message: 'Organization not found',
                    status: false 
                });
            }

            // Generate static OTP for development
            const otp = generateOTP();

            // Update organization with new OTP
            organisation.forgetPasswordOTP = otp;
            organisation.forgetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
            await organisation.save();

            // For development, sending static OTP in response
            res.status(200).json({
                message: 'Forget password OTP sent successfully',
                status: true,
                otp: "1234" // Static OTP for development
            });

        } catch (error) {
            console.error('Error in sendForgetPasswordOTP:', error);
            res.status(500).json({ 
                message: 'Error sending forget password OTP',
                status: false 
            });
        }
    };

    // Verify Forget Password OTP
    exports.verifyForgetPasswordOTP = async (req, res) => {
        try {
            const { mobileNumber, email, otp } = req.body;

            if ((!mobileNumber && !email) || !otp) {
                return res.status(400).json({ 
                    message: 'Either mobile number or email, and OTP are required',
                    status: false 
                });
            }

            // Find organization by mobile number or email
            let organisation;
            if (mobileNumber) {
                organisation = await OrganisationRegister.findOne({ mobileNumber });
            } else {
                organisation = await OrganisationRegister.findOne({ 
                    $or: [
                        { email: email },
                        { organiserEmail: email }
                    ]
                });
            }

            if (!organisation) {
                return res.status(404).json({ 
                    message: 'Organization not found',
                    status: false 
                });
            }

            // Check if OTP exists and is not expired
            if (!organisation.forgetPasswordOTP || !organisation.forgetPasswordOTPExpiry) {
                return res.status(400).json({ 
                    message: 'No OTP requested or OTP expired',
                    status: false 
                });
            }

            if (new Date() > organisation.forgetPasswordOTPExpiry) {
                return res.status(400).json({ 
                    message: 'OTP has expired',
                    status: false 
                });
            }

            if (organisation.forgetPasswordOTP !== otp) {
                return res.status(400).json({ 
                    message: 'Invalid OTP',
                    status: false 
                });
            }

            // Clear OTP after successful verification
            organisation.forgetPasswordOTP = undefined;
            organisation.forgetPasswordOTPExpiry = undefined;
            await organisation.save();

            res.status(200).json({
                message: 'OTP verified successfully',
                status: true
            });

        } catch (error) {
            console.error('Error in verifyForgetPasswordOTP:', error);
            res.status(500).json({ 
                message: 'Error verifying OTP',
                status: false 
            });
        }
    };

    // Reset Password
    exports.resetPassword = async (req, res) => {
        try {
            const { mobileNumber, email, newPassword } = req.body;

            if ((!mobileNumber && !email) || !newPassword) {
                return res.status(400).json({ 
                    message: 'Either mobile number or email, and new password are required',
                    status: false 
                });
            }

            // Find organization by mobile number or email
            let organisation;
            if (mobileNumber) {
                organisation = await OrganisationRegister.findOne({ mobileNumber });
            } else {
                organisation = await OrganisationRegister.findOne({ organiserEmail: email });
            }

            if (!organisation) {
                return res.status(404).json({ 
                    message: 'Organization not found',
                    status: false 
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            organisation.password = hashedPassword;
            await organisation.save();

            res.status(200).json({
                message: 'Password reset successfully',
                status: true
            });

        } catch (error) {
            console.error('Error in resetPassword:', error);
            res.status(500).json({ 
                message: 'Error resetting password',
                status: false 
            });
        }
    };

